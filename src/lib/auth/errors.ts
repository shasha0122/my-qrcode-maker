export function mapAuthError(message: string, code?: string) {
  const normalized = `${code ?? ""} ${message}`.toLowerCase();

  if (
    normalized.includes("invalid api key") ||
    normalized.includes("invalidapikey") ||
    normalized.includes("unauthorized")
  ) {
    return "인증 서버 키가 올바르지 않습니다. Vercel 환경 변수를 확인해 주세요.";
  }
  if (normalized.includes("invalid login credentials")) {
    return "이메일 또는 비밀번호가 올바르지 않습니다.";
  }
  if (normalized.includes("email not confirmed")) {
    return "이메일 인증이 완료되지 않았습니다. 받은편지함을 확인해 주세요.";
  }
  if (
    normalized.includes("user already registered") ||
    normalized.includes("already been registered")
  ) {
    return "이미 가입된 이메일입니다. 로그인해 주세요.";
  }
  if (normalized.includes("redirect")) {
    return "허용되지 않은 사이트 주소입니다. Supabase Redirect URLs에 배포 주소를 추가해 주세요.";
  }
  if (
    normalized.includes("error sending") ||
    normalized.includes("confirmation email") ||
    normalized.includes("over_email_send_rate_limit")
  ) {
    return "인증 메일을 보내지 못했습니다. 잠시 후 다시 시도해 주세요.";
  }
  if (normalized.includes("captcha")) {
    return "캡차 확인에 실패했습니다. 새로고침 후 다시 시도해 주세요.";
  }
  if (normalized.includes("password")) {
    return "비밀번호가 보안 요구사항을 충족하지 않습니다.";
  }
  if (normalized.includes("rate limit") || normalized.includes("too many")) {
    return "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.";
  }

  if (message.trim()) {
    return `요청을 처리하지 못했습니다. (${message})`;
  }

  return "요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.";
}
