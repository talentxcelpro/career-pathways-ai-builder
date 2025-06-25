
import Colleges from "../pages/Colleges";
import CollegeDetail from "../pages/colleges/CollegeDetail";

export const collegesRoutes = [
  {
    title: "Colleges",
    to: "/colleges",
    page: <Colleges />,
  },
  {
    title: "College Detail",
    to: "/colleges/:id",
    page: <CollegeDetail />,
  },
];
