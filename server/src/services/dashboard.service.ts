import { EmployeeModel } from "../models/Employee.js";

export const getDashboardStats = async () => {
  const [totalEmployees, activeEmployees, inactiveEmployees, departmentAggregation] =
    await Promise.all([
      EmployeeModel.countDocuments({ isDeleted: false }),
      EmployeeModel.countDocuments({ isDeleted: false, status: "ACTIVE" }),
      EmployeeModel.countDocuments({ isDeleted: false, status: "INACTIVE" }),
      EmployeeModel.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: "$department", count: { $sum: 1 } } },
        { $sort: { count: -1, _id: 1 } }
      ])
    ]);

  return {
    totalEmployees,
    activeEmployees,
    inactiveEmployees,
    departmentCount: departmentAggregation.length,
    departments: departmentAggregation.map((item) => ({
      name: item._id,
      count: item.count
    }))
  };
};

