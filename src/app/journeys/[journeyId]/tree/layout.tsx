export default async function Layout(props: {
  children: React.ReactNode;
  goal: React.ReactNode;
}) {
  return (
    <>
      {props.children}
      {props.goal}
    </>
  );
}
