use actix_web::web::{self, BytesMut};
use futures::stream::Stream;
use std::pin::Pin;
use std::sync::Arc;
use std::task::{Context, Poll};
use tauri::async_runtime::JoinHandle;
use tokio_util::codec::{BytesCodec, FramedRead};

pub struct AbortStream {
    pub inner: futures::stream::Map<
        FramedRead<tokio::io::DuplexStream, BytesCodec>,
        fn(Result<BytesMut, std::io::Error>) -> Result<web::Bytes, actix_web::Error>,
    >,
    pub handle: Arc<JoinHandle<()>>,
}

impl Stream for AbortStream {
    type Item = Result<web::Bytes, actix_web::Error>;

    fn poll_next(mut self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Option<Self::Item>> {
        match Pin::new(&mut self.inner).poll_next(cx) {
            Poll::Ready(Some(Ok(bytes))) => {
                // Convert BytesMut to actix_web::web::Bytes
                Poll::Ready(Some(Ok(bytes)))
            }
            Poll::Ready(Some(Err(e))) => {
                // Abort the blocking task
                self.handle.abort();
                Poll::Ready(Some(Err(e.into())))
            }
            Poll::Ready(None) => {
                // Abort the blocking task
                self.handle.abort();
                Poll::Ready(None)
            }
            Poll::Pending => Poll::Pending,
        }
    }
}
