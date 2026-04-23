import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  // Public routes
  route("login", "routes/login.tsx"),

  // Protected routes — wrapped in auth guard + admin layout
  layout("components/protected-route.tsx", [
    layout("routes/layout.tsx", [
      index("routes/dashboard.tsx"),
      route("countries", "routes/countries.tsx"),
      route("companies", "routes/companies.tsx"),
      route("employees", "routes/employees.tsx"),
      route("employees/:id", "routes/employee-detail.tsx"),
      route("bonuses", "routes/bonuses.tsx"),
      route("exports", "routes/exports.tsx"),
      route("settings", "routes/settings.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
