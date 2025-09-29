export const PasswordHint = () => {
  return (
    <ul role="list" className="text-muted-foreground list-inside list-disc text-xs">
      <li>Must be at least 8 characters long</li>
      <li>Cannot be entirely numeric</li>
      <li>Should not be too similar to your personal info</li>
      <li>Cannot be a commonly used password</li>
    </ul>
  );
};
