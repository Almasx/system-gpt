import { LinkTab, NavTabBar } from "~/components/ui/nav-tab-bar";

export default function RootLayout(props: {
  children: React.ReactNode;
  params: { journeyId: string };
}) {
  const path = `/journeys/${props.params.journeyId}`;

  return (
    <div className="bg-light-secondary">
      <div className="grid h-20 place-items-center">
        <NavTabBar initialTab={`${path}/chat`}>
          <LinkTab href={`${path}/chat`} label="Define root goal" />
          <LinkTab href={`${path}/tree`} label="Create plan" />
          <LinkTab href={`${path}/actions`} label="Divide to chunks" />
        </NavTabBar>
      </div>
      {props.children}
    </div>
  );
}
