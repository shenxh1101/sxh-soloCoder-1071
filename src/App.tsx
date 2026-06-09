import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { Layout } from "@/components/Layout/Layout";
import { CustomerList } from "@/pages/CustomerList";
import { CustomerDetail } from "@/pages/CustomerDetail";
import { Schedule } from "@/pages/Schedule";
import { Opportunities } from "@/pages/Opportunities";
import { Reports } from "@/pages/Reports";
import { useCRMStore } from "@/store/useCRMStore";

export default function App() {
  const { initData, customers } = useCRMStore();

  useEffect(() => {
    if (customers.length === 0) {
      initData();
    }
  }, [initData, customers.length]);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/customers" replace />} />
          <Route path="/customers" element={<CustomerList />} />
          <Route path="/customers/:id" element={<CustomerDetail />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/opportunities" element={<Opportunities />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="*" element={<Navigate to="/customers" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}
