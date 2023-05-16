use actix_web::web::Bytes;
use actix_web::Error;
use flume::Receiver;
use futures::stream::Stream;
use parking_lot::RwLock;
use std::pin::Pin;
use std::sync::Arc;
use std::task::{Context, Poll};

pub struct AbortStream {
    pub stream: Pin<Box<dyn Stream<Item = Bytes> + Send>>,
    pub abort_flag: Arc<RwLock<bool>>,
}

impl AbortStream {
    pub fn new(receiver: Receiver<Bytes>, abort_flag: Arc<RwLock<bool>>) -> Self {
        AbortStream {
            stream: Box::pin(receiver.into_stream()),
            abort_flag,
        }
    }
}

impl Stream for AbortStream {
    type Item = Result<Bytes, Error>;

    fn poll_next(mut self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Option<Self::Item>> {
        match self.stream.as_mut().poll_next(cx) {
            Poll::Ready(Some(bytes)) => Poll::Ready(Some(Ok(bytes))),
            Poll::Ready(None) => {
                println!("Stream ended");
                *self.abort_flag.write() = true;
                Poll::Ready(None)
            }
            Poll::Pending => Poll::Pending,
        }
    }
}
