import { ChatProvider, TreeProvider } from "~/components/providers";
import { LinkTab, TabBar } from "~/components/ui/tab-bar";

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <div className="bg-light-secondary">
      <ChatProvider>
        <TreeProvider>
          <div className="grid h-20 place-items-center">
            <TabBar initialTab="/">
              <LinkTab href="/" label="Step 1: Define root goal" />
              <LinkTab href="/tree/new" label="Step 2: Create plan" />
            </TabBar>
          </div>
          {props.children}
        </TreeProvider>
      </ChatProvider>
    </div>
  );
}
