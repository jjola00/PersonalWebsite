import AboutDetails from "@/components/about";

export const metadata = {
  title: "About",
};

export default function About() {
  return (
    <>
      <div className="w-full flex flex-col items-center text-center mb-8">
        <h1 className="font-bold text-4xl text-blue-100">
          About Me
        </h1>
      </div>

      <AboutDetails />
    </>
  );
}
