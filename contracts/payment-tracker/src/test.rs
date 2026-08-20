use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env, String};

#[test]
fn records_and_reads_payments() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(PaymentTracker, ());
    let client = PaymentTrackerClient::new(&env, &contract_id);
    let sender = Address::generate(&env);
    let destination = Address::generate(&env);

    let id = client.record(
        &sender,
        &destination,
        &25_000_000_i128,
        &String::from_str(&env, "invoice-42"),
    );

    assert_eq!(id, 1);
    assert_eq!(client.count(), 1);
    let record = client.get(&1).unwrap();
    assert_eq!(record.amount, 25_000_000_i128);
    assert_eq!(record.sender, sender);
    assert_eq!(client.recent(&10).len(), 1);
}

