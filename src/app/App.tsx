import { useState } from "react";
import { AuthProvider, useAuth, type UserRole } from "@/contexts/AuthContext";
import { LandingPage } from "@/app/pages/LandingPage";
import { RoleSelectPage } from "@/app/pages/RoleSelectPage";
import { LoginPage } from "@/app/pages/LoginPage";
import { KYCOnboarding } from "@/app/pages/KYCOnboarding";
import { InvestorLayout } from "@/app/components/InvestorLayout";
import { InvestorDashboard } from "@/app/pages/investor/InvestorDashboard";
import { MarketplacePage } from "@/app/pages/investor/MarketplacePage";
import { ProjectDetailsPage } from "@/app/pages/investor/ProjectDetailsPage";
import { PortfolioPage } from "@/app/pages/investor/PortfolioPage";
import { TransactionLedger } from "@/app/pages/investor/TransactionLedger";
import { IssuerDashboard } from "@/app/pages/issuer/IssuerDashboard";
import { CreateBondPage } from "@/app/pages/issuer/CreateBondPage";
import { MilestoneManagementPage } from "@/app/pages/issuer/MilestoneManagementPage";
import { AdminDashboard } from "@/app/pages/admin/AdminDashboard";
import { ProjectApprovalsPage } from "@/app/pages/admin/ProjectApprovalsPage";
import { InvestorDataProvider } from "@/contexts/InvestorDataContext";

function AppContent() {
  const [currentPage, setCurrentPage] = useState("landing");
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);
  const { user, isAuthenticated } = useAuth();

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  const handleRoleSelect = (role: Exclude<UserRole, null>) => {
    setSelectedRole(role);
    setCurrentPage("login");
  };

  const handleLoginSuccess = (role: UserRole) => {
    if (!role) {
      return;
    }
    if (role === "investor") {
      // If user has already completed KYC, skip onboarding
      if (user && user.kycCompleted) {
        setCurrentPage("investor-dashboard");
      } else {
        setCurrentPage("kyc");
      }
      return;
    }
    if (role === "issuer") {
      setCurrentPage("issuer-dashboard");
      return;
    }
    if (role === "admin") {
      setCurrentPage("admin-dashboard");
    }
  };

  const handleKYCComplete = () => {
    setCurrentPage("investor-dashboard");
  };

  // Landing and Auth Pages
  if (currentPage === "landing") {
    return <LandingPage onNavigate={handleNavigate} />;
  }

  if (currentPage === "role-select") {
    return <RoleSelectPage onSelectRole={handleRoleSelect} onBack={() => setCurrentPage("landing")} />;
  }

  if (currentPage === "login" && selectedRole) {
    return (
      <LoginPage
        role={selectedRole}
        onBack={() => setCurrentPage("role-select")}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  if (currentPage === "kyc") {
    return <KYCOnboarding onComplete={handleKYCComplete} />;
  }

  // Investor Pages
  if (isAuthenticated && user?.role === "investor") {
    return (
      <InvestorLayout currentPage={currentPage} onNavigate={handleNavigate}>
        {currentPage === "investor-dashboard" && <InvestorDashboard onNavigate={handleNavigate} />}
        {currentPage === "marketplace" && <MarketplacePage onNavigate={handleNavigate} />}
        {currentPage.startsWith("project-") && (
          <ProjectDetailsPage projectId={currentPage} onNavigate={handleNavigate} />
        )}
        {currentPage === "portfolio" && <PortfolioPage onNavigate={handleNavigate} />}
        {currentPage === "transactions" && <TransactionLedger />}
        {currentPage === "secondary-market" && (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-4">Secondary Market</h2>
            <p className="text-muted-foreground">Coming soon - Buy and sell tokens peer-to-peer</p>
          </div>
        )}
      </InvestorLayout>
    );
  }

  // Issuer Pages
  if (isAuthenticated && user?.role === "issuer") {
    return (
      <InvestorLayout currentPage={currentPage} onNavigate={handleNavigate}>
        {currentPage === "issuer-dashboard" && <IssuerDashboard onNavigate={handleNavigate} />}
        {currentPage === "create-bond" && <CreateBondPage onNavigate={handleNavigate} />}
        {currentPage === "milestones" && <MilestoneManagementPage onNavigate={handleNavigate} />}
      </InvestorLayout>
    );
  }

  // Admin Pages
  if (isAuthenticated && user?.role === "admin") {
    return (
      <InvestorLayout currentPage={currentPage} onNavigate={handleNavigate}>
        {currentPage === "admin-dashboard" && <AdminDashboard onNavigate={handleNavigate} />}
        {currentPage === "approve-projects" && <ProjectApprovalsPage onNavigate={handleNavigate} />}
        {(currentPage === "verify-issuers" || currentPage === "fraud-monitoring") && (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-4">
              {currentPage === "verify-issuers" && "Issuer Verification"}
              {currentPage === "fraud-monitoring" && "Fraud Monitoring"}
            </h2>
            <p className="text-muted-foreground">
              Full admin workflow interface - Available in complete implementation
            </p>
          </div>
        )}
      </InvestorLayout>
    );
  }

  // Fallback
  return <LandingPage onNavigate={handleNavigate} />;
}

export default function App() {
  return (
    <AuthProvider>
      <InvestorDataProvider>
        <AppContent />
      </InvestorDataProvider>
    </AuthProvider>
  );
}
