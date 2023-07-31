export default async function Layout(props: {
  children: React.ReactNode;
  goal: React.ReactNode;
  params: { journeyId: string };
}) {
  return (
    <>
      {props.children}
      {props.goal}
    </>
  );
}
