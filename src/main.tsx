import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { AppErrorBoundary } from "./components/AppErrorBoundary";
import "./styles/base.scss";
import "./styles/storefront-components.scss";
import "./styles/dialogs.scss";
import "./styles/header-search.scss";
import "./styles/catalog-responsive.scss";
import "./styles/product-dialog.scss";
import "./styles/motion.scss";
import "./styles/typography.scss";

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root application element");

createRoot(root).render(
  <StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </StrictMode>,
);
