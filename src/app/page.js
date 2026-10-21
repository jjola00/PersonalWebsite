import Navigation from "@/components/navigation";
import ProfileImage from "@/components/ProfileImage";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-between relative">
      <div className="w-full h-screen">
        <Navigation/>
        <ProfileImage className="-z-10" />
      </div>
    </div>
  );
}
