diesel::table! {
  threads (id) {
      id -> Integer,
      title -> Text,
  }
}

diesel::table! {
  messages (id) {
      id -> Integer,
      text -> Text,
      thread_id -> Integer,
  }
}
