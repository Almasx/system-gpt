import { LinkTab, NavTabBar } from "~/components/ui/nav-tab-bar";

import { ChatProvider } from "~/components/providers";

export default function RootLayout(props: {
  children: React.ReactNode;
  params: { journeyId: string };
}) {
  const path = `/journeys/${props.params.journeyId}`;

  return (
    <div className="bg-light-secondary">
      <ChatProvider journeyId={props.params.journeyId}>
        <div className="grid h-20 place-items-center">
          <NavTabBar initialTab={path}>
            <LinkTab href={path} label="Step 1: Define root goal" />
            <LinkTab href={`${path}/tree`} label="Step 2: Create plan" />
          </NavTabBar>
        </div>
        {props.children}
      </ChatProvider>
    </div>
  );
}
