import { useEffect, useState } from "react";
import bankApi from "../api/bankApi.js";
import transactionsApi from "../api/transactionsApi.js";
import BankAccountCard from "../components/BankAccountCard.jsx";
import AccountSuggestionCard from "../components/AccountSuggestionCard.jsx";
import GoalFormModal from "../components/GoalFormModal.jsx";
import TransferModal from "../components/TransferModal.jsx";
import ConvertESGModal from "../components/ConvertESGModal.jsx";
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
  const [convertESGAccount, setConvertESGAccount] = useState(null);
  const [convertESGModalOpen, setConvertESGModalOpen] = useState(false);
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
        console.log("Recipients data received:", data); // Debug log
        const recipientsList = Array.isArray(data) ? data : [];
        console.log("Recipients list:", recipientsList); // Debug log
        setRecipients(recipientsList);
      } catch (error) {
        console.error("Không thể tải danh sách người nhận", error);
        console.error("Error details:", error.response?.data); // Debug log
        setRecipients([]);
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
      // Bước 1: Gọi API ESG scoring để chấm điểm (chỉ tính điểm, không ghi nhận giao dịch)
      console.log("Step 1: Calling ESG scoring API...", payload);
      const esgResult = await transactionsApi.scoreESG(payload);
      console.log("ESG scoring result:", esgResult);

      // Bước 2: Gọi API transfer để ghi nhận giao dịch và cộng điểm ESG
      console.log("Step 2: Calling transfer API with ESG score...", {
        ...payload,
        esgScore: esgResult.esgScore,
      });
      const transferResult = await transactionsApi.transfer({
        ...payload,
        esgScore: esgResult.esgScore,
      });
      console.log("Transfer result:", transferResult);

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

      // Hiển thị thông báo với điểm ESG
      notify({
        type: "success",
        title: "Chuyển tiền thành công",
        message: `Đã chuyển ${Intl.NumberFormat("vi-VN").format(
          payload.amount
        )} VND. ${esgResult.message} (Hạng ${
          esgResult.esgGrade
        }, Điểm ESG: ${esgResult.esgScore.toFixed(
          2
        )}). Điểm ESG hiện tại: ${esgResult.account.esgPoint.toFixed(2)}.`,
      });
    } catch (error) {
      console.error("Chuyển tiền thất bại", error);
      console.error("Error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });

      // Kiểm tra nếu là lỗi 401, yêu cầu đăng nhập lại
      if (error.response?.status === 401) {
        notify({
          type: "danger",
          title: "Phiên đăng nhập hết hạn",
          message: "Vui lòng đăng nhập lại để tiếp tục.",
        });
        // Có thể redirect đến trang login ở đây
      } else {
        notify({
          type: "danger",
          title: "Chuyển tiền thất bại",
          message:
            error.response?.data?.message ||
            error.response?.data?.errors?.[0]?.msg ||
            "Không thể thực hiện giao dịch vào lúc này.",
        });
      }
      throw error;
    }
  };

  const handleConvertESG = (account) => {
    setConvertESGAccount(account);
    setConvertESGModalOpen(true);
  };

  const handleConvertESGSubmit = async (payload) => {
    try {
      const result = await transactionsApi.convertESGPoints(payload);

      setConvertESGModalOpen(false);
      setConvertESGAccount(null);

      await refreshAccounts();

      notify({
        type: "success",
        title: "Quy đổi thành công",
        message: `Đã quy đổi ${
          payload.points
        } điểm ESG thành ${Intl.NumberFormat("vi-VN").format(
          result.amountReceived
        )} VND. Số dư mới: ${Intl.NumberFormat("vi-VN").format(
          result.newBalance
        )} VND. Điểm ESG còn lại: ${result.remainingEsgPoints.toFixed(2)}.`,
      });
    } catch (error) {
      console.error("Quy đổi điểm ESG thất bại", error);
      notify({
        type: "danger",
        title: "Quy đổi thất bại",
        message:
          error.response?.data?.message ||
          error.response?.data?.errors?.[0]?.msg ||
          "Không thể quy đổi điểm ESG vào lúc này.",
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
                onConvertESG={handleConvertESG}
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
      <ConvertESGModal
        open={convertESGModalOpen}
        onClose={() => setConvertESGModalOpen(false)}
        onSubmit={handleConvertESGSubmit}
        account={convertESGAccount}
      />
    </div>
  );
};

export default BankAccounts;
