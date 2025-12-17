import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button"; // Assuming shadcn/ui button is available

const LandingPage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/login"); // Navigate to the login page to start the auth flow
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700 text-white p-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
          PathLight
        </h1>
        <p className="text-xl md:text-2xl mb-8 opacity-90">
          Your personalized guide to understanding and conquering debt.
          Get clear insights, tailored strategies, and dynamic guidance to financial freedom.
        </p>
        <Button
          onClick={handleGetStarted}
          className="bg-white text-blue-700 hover:bg-gray-100 text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out font-semibold"
          size="lg"
        >
          Show me my path forward
        </Button>
      </div>
    </div>
  );
};

export default LandingPage;