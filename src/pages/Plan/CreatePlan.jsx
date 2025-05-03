import React, { useEffect, useState } from "react";
import PlanModal from "../../components/PlanModal";
import planService from "../../store/Plan/planyService";
import { CiCalendarDate } from "react-icons/ci";
import { IoLocationSharp } from "react-icons/io5";
import { CgNotes } from "react-icons/cg";
import { FaEye, FaTrash } from "react-icons/fa";
import { FiEdit } from "react-icons/fi";
import DeleteModal from "../../components/DeleteModal";
import EditPlanModal from "../../components/EditPlanModal";
import toast from "react-hot-toast";
import ViewPlanModal from "../../components/ViewPlanModal";
import PlanCard from "../../components/PlanCard";

export default function CreatePlan() {
  const [selectedPlan, setSelectedPlan] = useState("daily");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPlanData, setSelectedPlanData] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const plans = [
    { label: "Daily Plan", value: "daily" },
    { label: "Weekly Plan", value: "weekly" },
    { label: "Monthly Plan", value: "monthly" },
  ];

  const [planData, setPlanData] = useState([]);

  const fetchPlanData = async () => {
    try {
      const response = await planService.getMyPlans(selectedPlan);
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
        setSelectedPlan("daily");
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
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold mr-6 py-2 px-4 rounded"
          >
            Add Plan +
          </button>
        </div>
        <div className="grid grid-cols-1 space-y-4">
          {planData.length > 0 ? (
            planData.map((plan, index) => (
              <div
                key={index}
                className="bg-gray-50 p-6 space-y-4 rounded-2xl shadow-md border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-lg capitalize font-semibold mb-2">
                    {selectedPlan} Plan
                  </h2>
                  <div className="flex gap-4">
                    <FaEye
                      size={26}
                      className="text-gray-600 hover:text-gray-700 cursor-pointer"
                      onClick={() => {
                        setSelectedPlanData(plan);
                        setIsViewModalOpen(true);
                      }}
                    />

                    <FiEdit
                      size={24}
                      className="text-blue-600 hover:text-blue-700 cursor-pointer"
                      onClick={() => {
                        setSelectedPlanData(plan);
                        setIsEditModalOpen(true);
                      }}
                    />

                    <FaTrash
                      onClick={() => {
                        setSelectedPlanId(plan._id);
                        setIsDeleteModalOpen(true);
                      }}
                      size={24}
                      className="text-red-600 hover:text-red-700 cursor-pointer"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <CiCalendarDate size={20} />
                  <p className="text-gray-600">
                    Visit Date: {new Date(plan.date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  {plan.region.map((region, index) => (
                    <div key={index} className="flex items-start gap-2 mb-2">
                      <IoLocationSharp size={20} />
                      <div>
                        <p className="text-gray-600">
                          Region {index + 1}: {region.location}
                        </p>
                        <p className="text-gray-800 flex items-center gap-2">
                          Status:{" "}
                          <span
                            className={`font-semibold text-xs capitalize w-fit px-2 py-0.5 rounded ${
                              {
                                completed: "bg-green-600 text-white",
                                pending: "bg-gray-300",
                                cancelled: "bg-red-600 text-white",
                              }[region.status?.toLowerCase().trim()] || ""
                            }`}
                          >
                            {region.status}
                          </span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border border-gray-200 rounded bg-gray-100 p-4">
                  <div className="flex items-center gap-2 mb-2 ">
                    <CgNotes size={20} />
                    <p className="text-gray-600">Notes:</p>
                  </div>
                  <div className="ml-10">{plan.notes}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full flex items-center justify-center h-40">
              <h2 className="text-lg font-semibold text-gray-500">
                No {selectedPlan} Plan Added
              </h2>
            </div>
          )}
        </div>
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
