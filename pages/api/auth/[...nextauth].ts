// pages/api/auth/[...nextauth].ts
import NextAuth, { NextAuthOptions } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";

// セッションとJWTの型拡張
declare module "next-auth" {
  interface Session {
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID,
      authorization: {
        params: {
          scope: "openid profile email User.Read Calendars.Read"
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, account }) {
      // 初回サインイン時にアクセストークンを保存
      if (account) {
        console.log("Setting access token in JWT");
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      // JWTからセッションにアクセストークンを渡す
      console.log("Setting access token in session");
      session.accessToken = token.accessToken;
      return session;
    }
  },
  debug: true,
  // セッションの設定を追加
  session: {
    strategy: "jwt"
  },
  // 必要に応じてサインインページをカスタマイズ
  pages: {
    signIn: '/auth/signin'
  }
};

export default NextAuth(authOptions);