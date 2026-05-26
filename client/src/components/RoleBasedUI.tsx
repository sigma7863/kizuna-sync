import { ReactNode } from "react";

type UserRole = "guardian" | "child" | "elderly" | undefined;

interface RoleBasedUIProps {
  role: UserRole;
  guardianOnly?: ReactNode;
  childOnly?: ReactNode;
  elderlyOnly?: ReactNode;
  allRoles?: ReactNode;
  children?: ReactNode;
}

/**
 * ロール別UI最適化コンポーネント
 * ユーザーのロールに応じて、異なるUIを表示します
 */
export function RoleBasedUI({
  role,
  guardianOnly,
  childOnly,
  elderlyOnly,
  allRoles,
  children,
}: RoleBasedUIProps) {
  if (allRoles) {
    return <>{allRoles}</>;
  }

  switch (role) {
    case "guardian":
      return <>{guardianOnly || children}</>;
    case "child":
      return <>{childOnly || children}</>;
    case "elderly":
      return <>{elderlyOnly || children}</>;
    default:
      return <>{children}</>;
  }
}

/**
 * 保護者向けUIコンポーネント
 * 管理・見守り機能を優先的に表示
 */
export function GuardianUI({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-4">
      {/* 見守り機能を優先 */}
      <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
        <p className="text-sm font-semibold text-green-900">👨‍👩‍👧‍👦 保護者向け</p>
        <p className="text-xs text-green-700 mt-1">
          家族の安全と見守り機能が優先的に表示されます
        </p>
      </div>
      {children}
    </div>
  );
}

/**
 * 子供向けUIコンポーネント
 * シンプルで直感的なインターフェース
 */
export function ChildUI({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-4">
      {/* シンプルなUIを提供 */}
      <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
        <p className="text-sm font-semibold text-blue-900">👧 子供向け</p>
        <p className="text-xs text-blue-700 mt-1">
          シンプルで分かりやすいインターフェースです
        </p>
      </div>
      {children}
    </div>
  );
}

/**
 * 高齢者向けUIコンポーネント
 * 大きなボタン・高コントラスト
 */
export function ElderlyUI({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-4">
      {/* 大きなボタンと高コントラスト */}
      <div className="p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
        <p className="text-sm font-semibold text-yellow-900">👴 高齢者向け</p>
        <p className="text-xs text-yellow-700 mt-1">
          大きなボタンと見やすい表示になっています
        </p>
      </div>
      {children}
    </div>
  );
}

/**
 * ロール別ボタンスタイルのユーティリティ
 */
export function getRoleButtonClass(role: UserRole): string {
  switch (role) {
    case "guardian":
      return "py-4 px-6 text-base font-semibold"; // 標準サイズ
    case "child":
      return "py-3 px-4 text-sm font-semibold"; // コンパクト
    case "elderly":
      return "py-6 px-8 text-lg font-bold"; // 大きなサイズ
    default:
      return "py-4 px-6 text-base font-semibold";
  }
}

/**
 * ロール別フォントサイズのユーティリティ
 */
export function getRoleFontClass(role: UserRole): string {
  switch (role) {
    case "guardian":
      return "text-base"; // 標準
    case "child":
      return "text-sm"; // 小さめ
    case "elderly":
      return "text-lg"; // 大きめ
    default:
      return "text-base";
  }
}

/**
 * ロール別コントラストのユーティリティ
 */
export function getRoleContrastClass(role: UserRole): string {
  switch (role) {
    case "guardian":
      return ""; // 標準コントラスト
    case "child":
      return ""; // 標準コントラスト
    case "elderly":
      return "contrast-125"; // 高コントラスト
    default:
      return "";
  }
}
