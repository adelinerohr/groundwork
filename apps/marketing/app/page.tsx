import { Hero } from '~/components/sections/hero';
import { Logos } from '~/components/sections/logos';
import { Problem } from '~/components/sections/problem';
import { Solution } from '~/components/sections/solution';

export default function Page() {
  return (
    <>
      <Hero />
      <Logos />
      <Problem />
      <Solution />
    </>
  );
}
