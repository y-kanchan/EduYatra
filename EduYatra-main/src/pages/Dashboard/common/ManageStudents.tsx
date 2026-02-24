import { Layout } from "@/components/Layout";
import { StudentBatchList } from "@/components/students/StudentBatchList";

export default function ManageStudents() {
  return (
    <Layout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <StudentBatchList />
      </div>
    </Layout>
  );
}
