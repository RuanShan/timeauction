require 'spec_helper'

describe Auction do

  it { should validate_presence_of(:title) }
  it { should validate_presence_of(:short_description) }
  it { should validate_presence_of(:description) }
  it { should validate_presence_of(:about) }
  it { should validate_presence_of(:start_time) }
  it { should validate_presence_of(:end_time) }
  it { should validate_presence_of(:volunteer_end_date) }
  # it { should validate_presence_of(:banner) }
  # it { should validate_presence_of(:image) }

  context "methods" do
    set(:auction) { FactoryGirl.create :auction_with_rewards, :rewards_count => 2 }
    set(:user) { FactoryGirl.create :user, :email => "johndoe@email.com" }
    set(:bid_1) { FactoryGirl.create :bid, :reward_id => auction.rewards.first.id, :user_id => user.id }
    set(:bid_2) { FactoryGirl.create :bid, :reward_id => auction.rewards.last.id, :user_id => user.id }
    set(:entry_1) { FactoryGirl.create :hours_entry, :bid_id => bid_1.id, :user_id => user.id }
    set(:entry_1neg) { FactoryGirl.create :hours_entry, :bid_id => bid_1.id, :user_id => user.id, :amount => -10 }
    set(:entry_2) { FactoryGirl.create :hours_entry, :bid_id => bid_2.id, :user_id => user.id }
    set(:entry_2neg) { FactoryGirl.create :hours_entry, :bid_id => bid_2.id, :user_id => user.id, :amount => -20 }

    context "reward hours" do
      before do
        entry_1.update_attributes(:amount => 10)
        entry_2.update_attributes(:amount => 20)
      end

      it "#hours_raised" do
        expect(auction.hours_raised).to eq(30)
      end

      it "#lowest_bid" do
        expect(auction.lowest_bid).to eq(auction.rewards.first.amount)
      end

      it "#average_bid" do
        expect(auction.average_bid).to eq("30")
      end
    end

    it "#rewards_ordered_by_lowest" do
      expect(auction.rewards_ordered_by_lowest.first).to eq(auction.rewards.first)
    end

    it "#volunteers" do
      expect(auction.volunteers).to eq([user])
    end

    it "#num_volunteers" do
      expect(auction.num_volunteers).to eq(1)
    end

    it "#days_left_to_bid > 48 hours" do
      auction.update_attributes(:start_time => Time.now, :end_time => Time.now + 1.week)
      expect(auction.days_left_to_bid).to eq([6, "days"])
    end

    it "#days_left_to_bid < 48 hours" do
      auction.update_attributes(:end_time => Time.now + 1.day)
      expect(auction.days_left_to_bid).to eq([23, "hours"])
    end

    it "#days_left_to_bid < 1 hour" do
      auction.update_attributes(:end_time => Time.now + 30.minutes)
      expect(auction.days_left_to_bid).to eq(["less than one hour", ""])
    end

    it "is #pending_approval" do
      auction.update_attributes(:submitted => true)
      expect(auction.pending_approval).to eq(true)
    end

    it "is not #pending_approval" do
      expect(auction.pending_approval).to eq(false)
      auction.update_attributes(:submitted => true, :approved => true)
      expect(auction.pending_approval).to eq(false)
    end

    it "has #started?" do
      auction.update_attributes(:start_time => Time.now)
      expect(auction.started?).to eq(true)
    end

    it "has not #started?" do
      auction.update_attributes(:start_time => Time.now + 1.day)
      expect(auction.started?).to eq(false)
    end

    it "is #over?" do
      auction.update_attributes(:end_time => Time.now - 1.day)
      expect(auction.over?).to eq(true)
    end

    it "is not #over?" do
      expect(auction.over?).to eq(false)
    end
  end
end
