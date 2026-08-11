"use client"
import { useRouter } from "next/navigation";
export default function Home() {

  const router = useRouter();
  return (
    <div>
      this is dashboard
      <br />

      <button style={{ color: "white", backgroundColor: "red" }} onClick={() => router.push("/dashboard/authentication")}> GO to Authentication page</button>

      <button style={{ color: "white", backgroundColor: "blue" }} onClick={() => router.push("/dashboard/http")}> GO to HTTP page</button>
      <button style={{ color: 'white', backgroundColor: 'purple' }} onClick={() => router.push("/dashboard/rest")}> GO TO REST page</button>
    </div>
  );
}