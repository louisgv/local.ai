use futures::Stream;
use hyper::body::Bytes;
use hyper::body::Frame;
use pin_project_lite::pin_project;
use std::cell::RefCell;
use std::io::Error;
use std::pin::Pin;
use std::task::{Context, Poll};

pin_project! {
    /// A body created from a `Stream`.
    #[derive(Clone, Debug)]
    pub struct AbortStream<S> {
        #[pin]
        pub stream: S,
        // pub handle: Arc<JoinHandle<()>>,
        pub abort_flag: RefCell<bool>,
    }
}

impl<S> Stream for AbortStream<S>
where
    S: Stream<Item = String> + Unpin,
{
    type Item = Result<Frame<Bytes>, Error>;

    fn poll_next(mut self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Option<Self::Item>> {
        let self_proj = self.as_mut().project();

        match self_proj.stream.poll_next(cx) {
            Poll::Ready(Some(data)) => {
                // Convert String to Frame<Bytes>
                Poll::Ready(Some(Ok(Frame::data(Bytes::from(data)))))
            }
            Poll::Ready(None) => {
                // Abort the blocking task
                println!("Stream ended");
                *self_proj.abort_flag.borrow_mut() = true;
                Poll::Ready(None)
            }
            Poll::Pending => Poll::Pending,
        }
    }

    fn size_hint(&self) -> (usize, Option<usize>) {
        self.stream.size_hint()
    }
}
