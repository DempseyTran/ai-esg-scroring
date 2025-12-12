import { useEffect, useState } from "react";
import bankApi from "../api/bankApi.js";
import transactionsApi from "../api/transactionsApi.js";
import BankAccountCard from "../components/BankAccountCard.jsx";
import AccountSuggestionCard from "../components/AccountSuggestionCard.jsx";
import GoalFormModal from "../components/GoalFormModal.jsx";
import TransferModal from "../components/TransferModal.jsx";
import LoadingScreen from "../components/LoadingScreen.jsx";
import { useNotification } from "../context/NotificationContext.jsx";
import { useRefresh } from "../context/RefreshContext.jsx";

const BankAccounts = () => {
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState([]);
  const [suggested, setSuggested] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [editingGoal, setEditingGoal] = useState(null);
  const [busyAccountId, setBusyAccountId] = useState(null);
  const [integratingId, setIntegratingId] = useState(null);
  const [recipients, setRecipients] = useState([]);
  const [transferAccount, setTransferAccount] = useState(null);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const { notify } = useNotification();
  const { bumpTransactions } = useRefresh();

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        setLoading(true);
        const result = await bankApi.getAccounts();
        setAccounts(result.linked || []);
        setSuggested(result.suggested || []);
      } catch (error) {
        console.error("Không thể tải danh sách tài khoản", error);
        notify({
          type: "danger",
          title: "Không thể tải tài khoản",
          message: "Vui lòng kiểm tra lại kết nối với máy chủ.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadAccounts();
  }, [notify]);

  useEffect(() => {
    const loadRecipients = async () => {
      try {
        const data = await bankApi.getRecipients();
        setRecipients(data || []);
      } catch (error) {
        console.error("Không thể tải danh sách người nhận", error);
      }
    };
    loadRecipients();
  }, []);
  const refreshAccounts = async () => {
    const result = await bankApi.getAccounts();
    setAccounts(result.linked || []);
    setSuggested(result.suggested || []);
  };

  const openGoalModal = (account, goal) => {
    setSelectedAccount(account);
    setEditingGoal(goal || null);
    setModalOpen(true);
  };

  const handleGoalSubmit = async (payload) => {
    if (!selectedAccount) return;
    try {
      if (editingGoal) {
        await bankApi.updateGoal(selectedAccount.id, editingGoal.id, payload);
      } else {
        await bankApi.createGoal(selectedAccount.id, payload);
      }
      await refreshAccounts();
      notify({
        type: editingGoal ? "info" : "success",
        title: editingGoal ? "Đã cập nhật mục tiêu" : "Đã tạo mục tiêu",
        message: editingGoal
          ? "Mục tiêu chi tiêu đã được điều chỉnh."
          : "Mục tiêu chi tiêu mới đã được thiết lập.",
      });
    } catch (error) {
      console.error("Không thể lưu mục tiêu", error);
      notify({
        type: "danger",
        title: "Không thể lưu mục tiêu",
        message: "Vui lòng kiểm tra dữ liệu và thử lại.",
      });
      throw error;
    }
  };

  const handleDeleteGoal = async (_account, goal) => {
    if (!goal) return;
    const confirmed = window.confirm(
      "Bạn có chắc muốn xóa mục tiêu chi tiêu này?"
    );
    if (!confirmed) return;
    try {
      await bankApi.deleteGoal(goal.bankAccountId || _account.id, goal.id);
      await refreshAccounts();
      notify({
        type: "info",
        title: "Đã xóa mục tiêu",
        message: "Mục tiêu chi tiêu đã được gỡ bỏ.",
      });
    } catch (error) {
      console.error("Không thể xóa mục tiêu", error);
      notify({
        type: "danger",
        title: "Xóa mục tiêu thất bại",
        message: "Không thể xóa mục tiêu vào lúc này.",
      });
    }
  };

  const handleSync = async (account) => {
    try {
      setBusyAccountId(account.id);
      const syncResult = await bankApi.syncAccount(account.id);
      await refreshAccounts();
      bumpTransactions();
      notify({
        type: "success",
        title: "Đồng bộ giao dịch thành công",
        message: `Thêm ${syncResult.inserted} giao dịch mới, bỏ qua ${syncResult.skipped}.`,
      });
    } catch (error) {
      console.error("Đồng bộ thất bại", error);
      notify({
        type: "danger",
        title: "Đồng bộ thất bại",
        message: "Không thể đồng bộ giao dịch, vui lòng thử lại.",
      });
    } finally {
      setBusyAccountId(null);
    }
  };

  const handleIntegrate = async (suggestion) => {
    try {
      setIntegratingId(suggestion.accountNumber);
      const linkedAccount = await bankApi.linkAccount({
        institutionId: suggestion.institutionId,
        accountNumber: suggestion.accountNumber,
      });
      await refreshAccounts();
      notify({
        type: "success",
        title: "Kết nối thành công",
        message: `Đã thêm tài khoản ${linkedAccount.bankName} • ${linkedAccount.maskedAccount}.`,
      });
    } catch (error) {
      console.error("Kết nối tài khoản thất bại", error);
      notify({
        type: "danger",
        title: "Không thể kết nối",
        message: "Không thể kết nối tài khoản được đề xuất. Vui lòng thử lại.",
      });
    } finally {
      setIntegratingId(null);
    }
  };

  const openTransferModal = (account) => {
    setTransferAccount(account);
    setTransferModalOpen(true);
  };

  const handleTransfer = async (payload) => {
    try {
      const result = await transactionsApi.transfer(payload);
      // Đóng modal trước để UX tốt hơn
      setTransferModalOpen(false);
      setTransferAccount(null);
      
      // Refresh dữ liệu và trigger reload transactions
      await Promise.all([
        refreshAccounts(),
        bankApi.getRecipients().then(setRecipients),
      ]);
      
      // Bump transactions version để trigger reload ở Transactions page
      bumpTransactions();
      
      notify({
        type: "success",
        title: "Chuyển tiền thành công",
        message: `Đã chuyển ${Intl.NumberFormat("vi-VN").format(
          payload.amount
        )} VND tới ${result.targetAccount.bankName} • ${
          result.targetAccount.accountNumber
        }. Giao dịch đã được ghi nhận.`,
      });
    } catch (error) {
      console.error("Chuyển tiền thất bại", error);
      notify({
        type: "danger",
        title: "Chuyển tiền thất bại",
        message:
          error.response?.data?.message ||
          error.response?.data?.errors?.[0]?.msg ||
          "Không thể thực hiện giao dịch vào lúc này.",
      });
      throw error;
    }
  };

  if (loading) {
    return <LoadingScreen message="Đang tải danh sách tài khoản..." />;
  }

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            Tài khoản ngân hàng đã liên kết
          </h2>
          <p className="text-sm text-slate-500">
            Đồng bộ và cấu hình hạn mức chi tiêu cho từng tài khoản nhằm theo
            dõi sát sao.
          </p>
        </div>

        {accounts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            Bạn chưa có tài khoản nào được liên kết. Hãy sử dụng danh sách gợi ý
            bên dưới để kết nối nhanh chóng thông qua Open Banking.
          </div>
        ) : (
          <div className="space-y-5">
            {accounts.map((account) => (
              <BankAccountCard
                key={account.id}
                account={account}
                syncing={busyAccountId === account.id}
                onSync={handleSync}
                onCreateGoal={(acc) => openGoalModal(acc)}
                onEditGoal={(acc, goal) => openGoalModal(acc, goal)}
                onDeleteGoal={handleDeleteGoal}
                onTransfer={openTransferModal}
              />
            ))}
          </div>
        )}
      </section>

      {suggested.length > 0 && (
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Tài khoản được đề xuất tích hợp
            </h2>
            <p className="text-sm text-slate-500">
              Dựa trên dữ liệu Open Banking, hệ thống phát hiện các tài khoản
              thuộc sở hữu của bạn nhưng chưa cấp quyền đồng bộ cho ví.
            </p>
          </div>
          <div className="space-y-3">
            {suggested.map((item) => (
              <AccountSuggestionCard
                key={`${item.institutionId}-${item.accountNumber}`}
                suggestion={item}
                loading={integratingId === item.accountNumber}
                onIntegrate={handleIntegrate}
              />
            ))}
          </div>
        </section>
      )}

      <GoalFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleGoalSubmit}
        account={selectedAccount}
        initialData={editingGoal}
      />
      <TransferModal
        open={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        onSubmit={handleTransfer}
        sourceAccount={transferAccount}
        recipients={recipients}
      />
    </div>
  );
};

export default BankAccounts;
