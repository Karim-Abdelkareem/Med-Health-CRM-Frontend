import React, { useEffect, useState } from "react";
import PlanModal from "../../components/PlanModal";
import planService from "../../store/Plan/planyService";
import DeleteModal from "../../components/DeleteModal";
import EditPlanModal from "../../components/EditPlanModal";
import toast from "react-hot-toast";
import ViewPlanModal from "../../components/ViewPlanModal";
import PlanCard from "../../components/PlanCard";
import monthlyService from "../../store/Monthly/monthlyService";
import MonthlyPlan from "../../components/Representative/MonthlyPlan";
import WeeklyPlan from "../../components/Representative/WeeklyPlan";
import DaliyPlan from "../../components/Representative/DaliyPlan";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function CreatePlan() {
  const [selectedPlan, setSelectedPlan] = useState("monthly");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPlanData, setSelectedPlanData] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [openWeeks, setOpenWeeks] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Function to check if it's the last 7 days of the month
  const isLastWeekOfMonth = () => {
    const today = new Date();
    const lastDayOfMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0
    );
    const daysUntilEndOfMonth = lastDayOfMonth.getDate() - today.getDate();

    return daysUntilEndOfMonth <= 7;
  };

  // Function to check if user can create or edit plan
  const canCreateOrEditPlan = () => {
    // Allow if it's the last week of the month
    if (isLastWeekOfMonth()) return true;

    // Allow if user has no plans
    if (!planData.plans || planData.plans.length === 0) return true;

    return false;
  };

  const plans = [
    { label: "Monthly Plan", value: "monthly" },
    { label: "Weekly Plan", value: "weekly" },
    { label: "Daily Plan", value: "daily" },
  ];

  const [planData, setPlanData] = useState([]);

  const fetchPlanData = async () => {
    try {
      setIsLoading(true);
      const response = await monthlyService.getCurrentMonthPlan();
      setPlanData(response.data);
    } catch (error) {
      console.error("Failed to fetch plan data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    switch (selectedPlan) {
      case "daily":
        setSelectedPlan("daily");
        fetchPlanData();
        break;
      case "weekly":
        setSelectedPlan("weekly");
        fetchPlanData();
        break;
      case "monthly":
        setSelectedPlan("monthly");
        fetchPlanData();
        break;
      default:
        setSelectedPlan("monthly");
        fetchPlanData();
        break;
    }
  }, [selectedPlan]);

  //Delete Plan
  const deletePlan = async (id) => {
    try {
      await planService.deletePlan(id);
      toast.success("Plan deleted successfully");
      fetchPlanData();
    } catch (err) {
      console.error("Error deleting plan:", err);
    }
  };

  //Update Plan
  const updatePlan = async (updatedPlan) => {
    try {
      await planService.updatePlan(updatedPlan._id, updatedPlan);
      toast.success("Plan updated successfully");
      fetchPlanData();
    } catch (err) {
      console.error("Error updating plan:", err);
    }
  };

  return (
    <div className="mx-6 space-y-4 my-6">
      <h1 className="text-3xl mx-2 font-bold">Create Plan</h1>

      {!canCreateOrEditPlan() && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mx-2">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                {planData.plans?.length > 0
                  ? "You can only create or edit plans during the last week of the month."
                  : "You can create your first plan now."}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mx-2">
        {plans.map((plan) => (
          <PlanCard
            key={plan.value}
            plan={plan}
            disabled={
              !canCreateOrEditPlan() ||
              (plan.value !== "monthly" &&
                (!planData.plans || planData.plans.length === 0))
            }
            isSelected={selectedPlan === plan.value}
            onClick={() => {
              if (
                canCreateOrEditPlan() &&
                (plan.value === "monthly" ||
                  (planData.plans && planData.plans.length > 0))
              ) {
                setSelectedPlan(plan.value);
              }
            }}
          />
        ))}
      </div>

      <div className="mx-2 mt-4 text-gray-600">
        Selected Plan:{" "}
        <span className="font-medium capitalize">{selectedPlan}</span>
        {selectedPlan !== "monthly" &&
          (!planData.plans || planData.plans.length === 0) && (
            <span className="text-red-500 text-sm ml-2">
              (You need to create a monthly plan first)
            </span>
          )}
      </div>

      {/* Plan Form */}
      <div className="mx-2 space-y-10 mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold mb-4">Add Your Plan</h2>
          <button
            onClick={() => setIsOpen(true)}
            disabled={!canCreateOrEditPlan()}
            className={`bg-blue-500 hover:bg-blue-600 text-white font-semibold mr-6 py-2 px-4 rounded ${
              !canCreateOrEditPlan() ? "opacity-50 cursor-not-allowed" : ""
            }`}
            title={
              !canCreateOrEditPlan()
                ? "You can only add a new plan in the last 7 days of the month"
                : "Add a new plan"
            }
          >
            Add Plan +
          </button>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center h-40 bg-gray-50 rounded-lg">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            {selectedPlan === "monthly" && (
              <MonthlyPlan
                planData={planData}
                selectedPlan={selectedPlan}
                setIsViewModalOpen={setIsViewModalOpen}
                setIsEditModalOpen={setIsEditModalOpen}
                setIsDeleteModalOpen={setIsDeleteModalOpen}
                setSelectedPlanId={setSelectedPlanId}
                setSelectedPlanData={setSelectedPlanData}
              />
            )}
            {selectedPlan === "weekly" && (
              <WeeklyPlan
                planData={planData}
                openWeeks={openWeeks}
                setOpenWeeks={setOpenWeeks}
                setIsViewModalOpen={setIsViewModalOpen}
                setIsEditModalOpen={setIsEditModalOpen}
                setIsDeleteModalOpen={setIsDeleteModalOpen}
                setSelectedPlanId={setSelectedPlanId}
                setSelectedPlanData={setSelectedPlanData}
              />
            )}
            {selectedPlan === "daily" && (
              <DaliyPlan
                planData={planData}
                setIsViewModalOpen={setIsViewModalOpen}
                setIsEditModalOpen={setIsEditModalOpen}
                setSelectedPlanData={setSelectedPlanData}
              />
            )}
          </>
        )}
      </div>
      {/* Create Plan Modal */}
      <PlanModal
        planOption={"Add New Plan"}
        planType={selectedPlan}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        fetchPlanData={fetchPlanData}
      />
      {/* Delete Modal */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          deletePlan(selectedPlanId);
          setIsDeleteModalOpen(false);
        }}
        itemName="this plan"
      />
      {/* Edit Plan Modal */}
      <EditPlanModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdate={updatePlan}
        selectedPlanData={selectedPlanData}
      />
      {/* View Plan Modal */}
      <ViewPlanModal
        isOpen={isViewModalOpen}
        setIsOpen={setIsViewModalOpen}
        plan={selectedPlanData}
      />
    </div>
  );
}
