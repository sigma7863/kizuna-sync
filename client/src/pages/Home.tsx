import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Users, Plus, LogOut, Home as HomeIcon, Share2, Zap } from "lucide-react";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useLocation } from "wouter";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeModeSwitcher } from "@/components/ThemeModeSwitcher";
import { FamilyQuickWidget } from "@/components/FamilyQuickWidget";
import { useI18n } from "@/contexts/I18nContext";

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { t } = useI18n();
  const [familyName, setFamilyName] = useState("");
  const [selectedRole, setSelectedRole] = useState<"guardian" | "child" | "elderly">("guardian");

  // Queries
  const { data: familyGroups, refetch: refetchFamilyGroups } = trpc.family.getUserGroups.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Mutations
  const createFamilyMutation = trpc.family.create.useMutation({
    onSuccess: (data) => {
      setFamilyName("");
      // Invalidate and refetch
      void refetchFamilyGroups();
    },
  });

  const handleCreateFamily = async () => {
    if (familyName.trim()) {
      await createFamilyMutation.mutateAsync({ name: familyName });
    }
  };

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-blue-50">
        <div className="text-center">
          <div className="animate-pulse">
            <Heart className="w-12 h-12 text-pink-400 mx-auto mb-4" />
            <p className="text-gray-600">{t("home.loading")}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 px-4 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="absolute right-4 top-4">
          <ThemeModeSwitcher />
        </div>
        <div className="text-center max-w-md">
          <div className="mb-8">
            <Heart className="w-16 h-16 text-pink-500 mx-auto mb-4 animate-pulse" />
            <h1 className="text-4xl font-bold text-gray-800 mb-2">KizunaSync</h1>
            <p className="text-lg text-gray-600">{t("home.tagline")}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <p className="text-gray-700 mb-6">
              {t("home.description")}
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-left">
                <Zap className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                <span className="text-gray-700">{t("home.featureRipple")}</span>
              </div>
              <div className="flex items-center gap-3 text-left">
                <Share2 className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <span className="text-gray-700">AIが家族の物語を自動で作成</span>
              </div>
              <div className="flex items-center gap-3 text-left">
                <Users className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">子供から高齢者まで安心して使える</span>
              </div>
            </div>

            <Button
              onClick={() => window.location.href = getLoginUrl()}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold py-3 rounded-lg"
            >
              {t("common.login")}
            </Button>
          </div>

          <p className="text-sm text-gray-500">
            {t("home.loginHint")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 dark:bg-slate-900 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-8 h-8 text-pink-500" />
            <h1 className="text-2xl font-bold text-gray-800">KizunaSync</h1>
          </div>
          <div className="flex items-center gap-1 sm:gap-3">
            <ThemeModeSwitcher />
            <LanguageSwitcher />
            <span className="hidden text-sm text-gray-600 sm:inline">{user?.name}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2 px-2 sm:px-3"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">{t("common.logout")}</span>
              <span className="sr-only sm:hidden">{t("common.logout")}</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" tabIndex={-1} className="max-w-6xl mx-auto px-4 py-8">
        {familyGroups?.[0] && (
          <div className="mb-6 md:hidden">
            <FamilyQuickWidget
              familyGroupId={familyGroups[0].id}
              onOpenSafety={() => setLocation(`/family/${familyGroups[0].id}?tab=safety`)}
              onOpenAssistant={() => setLocation(`/family/${familyGroups[0].id}?tab=assistant`)}
              onOpenAlbum={() => setLocation(`/family/${familyGroups[0].id}?tab=album`)}
            />
          </div>
        )}
        {/* Create Family Section */}
        <div className="mb-8">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold py-3 px-6 rounded-lg flex items-center gap-2">
                <Plus className="w-5 h-5" />
                {t("home.createFamily")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("home.createFamily")}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="family-name">{t("home.groupName")}</Label>
                  <Input
                    id="family-name"
                    placeholder={t("home.groupPlaceholder")}
                    value={familyName}
                    onChange={(e) => setFamilyName(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <Button
                  onClick={handleCreateFamily}
                  disabled={!familyName.trim() || createFamilyMutation.isPending}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-500"
                >
                  {createFamilyMutation.isPending ? t("home.creating") : t("home.create")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Family Groups Grid */}
        {familyGroups && familyGroups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {familyGroups.map((group) => (
              <Card
                key={group.id}
                className="p-6 hover:shadow-lg transition-shadow cursor-pointer bg-white border-0 shadow-md"
                onClick={() => setLocation(`/family/${group.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{group.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(group.createdAt).toLocaleDateString()} {t("home.createdAt")}
                    </p>
                  </div>
                  <Users className="w-6 h-6 text-pink-400" />
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLocation(`/family/${group.id}`);
                  }}
                >
                  <HomeIcon className="w-4 h-4 mr-2" />
                  {t("common.open")}
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center bg-white border-0 shadow-md">
            <Heart className="w-16 h-16 text-pink-200 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {t("home.noFamilies")}
            </h3>
            <p className="text-gray-600 mb-6">
              {t("home.noFamiliesHint")}
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-pink-500 to-purple-500 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  {t("home.createGroup")}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("home.createFamily")}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="family-name">{t("home.groupName")}</Label>
                    <Input
                      id="family-name"
                      placeholder={t("home.groupPlaceholder")}
                      value={familyName}
                      onChange={(e) => setFamilyName(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <Button
                    onClick={handleCreateFamily}
                    disabled={!familyName.trim() || createFamilyMutation.isPending}
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-500"
                  >
                    {createFamilyMutation.isPending ? t("home.creating") : t("home.create")}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </Card>
        )}
      </main>
    </div>
  );
}
