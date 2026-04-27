import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("/home", "routes/home.tsx"),
  route("/countries", "routes/countries.tsx"),
  route("/companies", "routes/companies.tsx"),
  route("/customers", "routes/customers.tsx"),
  route("/customers/:id", "routes/customer.$id.tsx"),
  route("/design-system", "routes/design-system.tsx"),
  route("/settings", "routes/settings.tsx"),
  route("/unauthorized", "routes/unauthorized.tsx")
] satisfies RouteConfig;
