import Calendar from "@/components/calendar/Calendar";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calendar | AuraHQ",
  description: "Company event and schedule management portal.",
};
export default function page() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Calendar" />
      <Calendar />
    </div>
  );
}
