Feature('Checkout to payment to order tracking - real backend, simulated providers');

for (const method of ['COD', 'VNPAY', 'MOMO', 'BANK_TRANSFER']) {
  Scenario(`${method}: outside HCM costs 30,000 VND and order can be tracked`, ({ I }) => {
    I.startCheckoutJourney(method);
    I.verifyCheckoutFee(30000);
    I.submitCheckout(method);
    if (method !== 'COD') I.simulateProviderCallback();
    const payment = method === 'COD' ? 'PENDING' : 'PAID';
    I.seePersistedOrder('PENDING', payment);
    I.staffAdvancesOrder('CONFIRMED');
    I.seePersistedOrder('CONFIRMED', payment);
    I.staffAdvancesOrder('SHIPPING');
    I.seePersistedOrder('SHIPPING', payment);
    I.customerConfirmsDelivery();
    I.seePersistedOrder('DELIVERED', 'PAID');
  });
}

Scenario('VNPay declined callback keeps order unpaid and displays failure', ({ I }) => {
  I.startCheckoutJourney('VNPAY_DECLINED');
  I.verifyCheckoutFee(30000);
  I.submitCheckout('VNPAY');
  I.simulateProviderCallback('declined');
  I.seePersistedOrder('PENDING', 'PENDING');
});

Scenario('HCM control uses carrier quote instead of outside-region fixed fee', ({ I }) => {
  I.startCheckoutJourney('HCM');
  I.verifyCheckoutFee(19000);
  I.submitCheckout('COD');
  I.seePersistedOrder('PENDING', 'PENDING');
});
