import { useEffect, useState } from "react";
import goalsApi from "../api/goalsApi.js";
import bankApi from "../api/bankApi.js";
import GoalProgressCard from "../components/GoalProgressCard.jsx";
import GoalFormModal from "../components/GoalFormModal.jsx";
import LoadingScreen from "../components/LoadingScreen.jsx";
import { useNotification } from "../context/NotificationContext.jsx";

const Goals = () => {
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState([]);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [accountsMap, setAccountsMap] = useState({});
  const { notify } = useNotification();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [goalsRes, accountsRes] = await Promise.all([
          goalsApi.list(),
          bankApi.getAccounts()
        ]);
        setGoals(goalsRes || []);
        const map = {};
        (accountsRes.linked || []).forEach((account) => {
          map[account.id] = account;
        });
        setAccountsMap(map);
      } catch (error) {
        console.error("Không thể tải thông tin mục tiêu", error);
        notify({
          type: "danger",
          title: "Không thể tải mục tiêu",
          message: "Vui lòng kiểm tra lại kết nối với máy chủ."
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [notify]);

  const refreshGoals = async () => {
    const goalsRes = await goalsApi.list();
    setGoals(goalsRes || []);
  };

  const handleEditGoal = (goal) => {
    setSelectedGoal(goal);
    setSelectedAccount(
      accountsMap[goal.bankAccountId] || {
        id: goal.bankAccountId,
        bankName: goal.bankName,
        maskedAccount: goal.maskedAccount
      }
    );
    setModalOpen(true);
  };

  const handleDeleteGoal = async (goal) => {
    const confirmed = window.confirm('Bạn có chắc muốn xóa mục tiêu này?');
    if (!confirmed) return;
    try {
      await bankApi.deleteGoal(goal.bankAccountId, goal.id);
      await refreshGoals();
      notify({
        type: "info",
        title: "Đã xóa mục tiêu",
        message: "Mục tiêu chi tiêu đã được gỡ bỏ."
      });
    } catch (error) {
      console.error("Không thể xóa mục tiêu", error);
      notify({
        type: "danger",
        title: "Xóa mục tiêu thất bại",
        message: "Không thể xóa mục tiêu vào lúc này."
      });
    }
  };

  const handleSubmitGoal = async (payload) => {
    if (!selectedGoal) return;
    try {
      await bankApi.updateGoal(selectedGoal.bankAccountId, selectedGoal.id, payload);
      await refreshGoals();
      notify({
        type: "success",
        title: "Đã cập nhật mục tiêu",
        message: "Mục tiêu chi tiêu đã được điều chỉnh."
      });
    } catch (error) {
      console.error("Không thể cập nhật mục tiêu", error);
      notify({
        type: "danger",
        title: "Cập nhật thất bại",
        message: "Không thể cập nhật mục tiêu. Vui lòng thử lại."
      });
      throw error;
    }
  };

  if (loading) {
    return <LoadingScreen message="Đang tải mục tiêu chi tiêu..." />;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800">
          Quản lý mục tiêu chi tiêu
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Kiểm soát hiệu quả giới hạn chi tiêu theo từng tài khoản ngân hàng. Bạn có thể tạo mục tiêu
          mới tại trang &ldquo;Tài khoản ngân hàng&rdquo; và chỉnh sửa tại đây.
        </p>
      </div>

      {goals.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          Chưa có mục tiêu nào được thiết lập. Hãy chuyển tới trang &ldquo;Tài khoản ngân hàng&rdquo;
          để tạo mới.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {goals.map((goal) => (
            <GoalProgressCard
              key={goal.id}
              goal={goal}
              onEdit={() => handleEditGoal(goal)}
              onDelete={() => handleDeleteGoal(goal)}
            />
          ))}
        </div>
      )}

      <GoalFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmitGoal}
        account={selectedAccount}
        initialData={selectedGoal}
      />
    </div>
  );
};

export default Goals;

