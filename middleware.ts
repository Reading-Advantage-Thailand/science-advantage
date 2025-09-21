import { withAuth } from "next-auth/middleware";

import { DEV_AUTH_COOKIE, isDevAuthEnabled } from "@/lib/dev-auth";

export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      if (token) {
        return true;
      }

      if (isDevAuthEnabled()) {
        const devCookie = req.cookies.get(DEV_AUTH_COOKIE);
        return Boolean(devCookie?.value);
      }

      return false;
    },
  },
  pages: {
    signIn: "/signin",
  },
});

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*", "/lessons/:path*", "/classes/:path*"],
};
