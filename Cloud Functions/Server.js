exports.notifyAdmin = functions.database.ref("/orders/{orderId}")
.onCreate((snap, context) => {
  const order = snap.val();
  
  return admin.messaging().sendToTopic("admin", {
    notification: {
      title: "Pesanan Baru!",
      body: `Customer memesan ${order.service}`
    }
  });
});
