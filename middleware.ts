import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token }) => Boolean(token),
  },
  pages: {
    signIn: "/signin",
  },
});

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
};
