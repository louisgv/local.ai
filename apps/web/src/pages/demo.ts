export const getServerSideProps = async () => {
  return {
    redirect: {
      destination: `/case/0`,
      permanent: false
    }
  }
}

export default function DemoIndexPage() {
  return null
}
