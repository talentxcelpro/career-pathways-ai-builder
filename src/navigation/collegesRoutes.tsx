
import EnhancedColleges from "../pages/enhanced/Colleges";
import CollegeDetail from "../pages/colleges/CollegeDetail";

export const collegesRoutes = [
  {
    title: "Colleges",
    to: "/colleges",
    page: <EnhancedColleges />,
  },
  {
    title: "College Detail",
    to: "/colleges/:id",
    page: <CollegeDetail />,
  },
];
