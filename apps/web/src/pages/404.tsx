import { ArrowLeftIcon } from "@radix-ui/react-icons"
import type { NextPage } from "next"
import Link from "next/link"

const NotFound404Page: NextPage = () => {
  return (
    <article title="404">
      <hr />
      <h2>Where no one has gone before</h2>
      <blockquote style={{ maxWidth: 470 }}>
        <p className="text-justify">
          {`We're the same. We share the same history, the same heritage, the
              same lives. We're tied together beyond any untying. Man or woman,
              it makes no difference. We're human. We couldn't escape from each
              other even if we wanted to. That's how you do it, by remembering
              who and what you are - a bit of flesh and blood afloat in a
              universe without end. The only thing that's truly yours is the
              rest of humanity.`}
        </p>
      </blockquote>
      <Link href={"/"} className="flex items-center gap-2">
        <ArrowLeftIcon />
        Back to Base
      </Link>
    </article>
  )
}

export default NotFound404Page
