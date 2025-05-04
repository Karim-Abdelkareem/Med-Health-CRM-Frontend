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

export default function CreatePlan() {
  const [selectedPlan, setSelectedPlan] = useState("monthly");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPlanData, setSelectedPlanData] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [openWeeks, setOpenWeeks] = useState({});

  const plans = [
    { label: "Monthly Plan", value: "monthly" },
    { label: "Weekly Plan", value: "weekly" },
    { label: "Daily Plan", value: "daily" },
  ];

  const [planData, setPlanData] = useState([]);

  const fetchPlanData = async () => {
    try {
      const response = await monthlyService.getCurrentMonthPlan();
      setPlanData(response.data);
    } catch (err) {
      console.log(err);
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
      console.log(err);
    }
  };

  //Update Plan
  const updatePlan = async (updatedPlan) => {
    try {
      await planService.updatePlan(updatedPlan._id, updatedPlan);
      toast.success("Plan updated successfully");
      fetchPlanData();
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  return (
    <div className="mx-6 space-y-4 my-6">
      <h1 className="text-3xl mx-2 font-bold">Create Plan</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mx-2">
        {plans.map((plan) => (
          <PlanCard
            key={plan.value}
            plan={plan}
            disabled={!planData.plans?.length > 0}
            isSelected={selectedPlan === plan.value}
            onClick={() => setSelectedPlan(plan.value)}
          />
        ))}
      </div>

      <div className="mx-2 mt-4 text-gray-600">
        Selected Plan:{" "}
        <span className="font-medium capitalize">{selectedPlan}</span>
      </div>

      {/* Plan Form */}
      <div className="mx-2 space-y-10 mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold mb-4">Add Your Plan</h2>
          <button
            onClick={() => setIsOpen(true)}
            disabled={planData.plans?.length > 0}
            className={`bg-blue-500 hover:bg-blue-600 text-white font-semibold mr-6 py-2 px-4 rounded ${
              planData.plans?.length > 0 ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Add Plan +
          </button>
        </div>
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
            selectedPlan={selectedPlan}
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
        plan={selectedPlanData}
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
