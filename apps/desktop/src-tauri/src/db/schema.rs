diesel::table! {
  chats (id) {
      id -> Integer,
      title -> Text,
  }
}

diesel::table! {
  messages (id) {
      id -> Integer,
      text -> Text,
      chat_id -> Integer,
  }
}
