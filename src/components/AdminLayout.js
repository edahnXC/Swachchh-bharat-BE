import React from "react";
import { Outlet } from "react-router-dom";
import AdminPanel from "./AdminPanel";

const AdminLayout = () => {
  return (
    <div className="admin-app">
      <AdminPanel>
        <Outlet />
      </AdminPanel>
    </div>
  );
};

export default AdminLayout;