import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/login", "routes/login.tsx"),
  route("/countries", "routes/countries.tsx"),
  route("/companies", "routes/companies.tsx"),
  route("/customers", "routes/customers.tsx"),
  route("/customers/:id", "routes/customer.$id.tsx"),
  route("/design-system", "routes/design-system.tsx"),
  route("/settings", "routes/settings.tsx")
] satisfies RouteConfig;
