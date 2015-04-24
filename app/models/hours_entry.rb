class HoursEntry < ActiveRecord::Base
  include ApplicationHelper
  
  validates :organization, :amount, :contact_name, :contact_phone, :contact_email, presence: true, :if => :user_entered?
  validates :contact_email, :format => { :with => /^\s*(([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})[\s\/,;]*)+$/i, :message => "is not a valid email", :multiline => true }, :if => :user_entered?
  validates_numericality_of :amount, greater_than: 0, :if => :user_entered?

  before_save :send_verified_email
  before_save :link_to_nonprofit, :if => :can_link_to_nonprofit?

  belongs_to :user
  belongs_to :bid
  belongs_to :nonprofit

  scope :earned, -> { where('amount > ? AND verified = ?', 0, true) }
  scope :pending, -> { where('amount > ? AND verified != ?', 0, true) }
  scope :used, -> { where('amount < 0') }

  def earned?
    amount > 0
  end

  def used?
    !earned?
  end

  def amount_in_words
    "#{amount} volunteer #{'hour'.pluralize(amount)}"
  end

  def send_verification_email
    HoursEntryMailer.verification(self).deliver
    self.update_attributes(:verification_sent_at => Time.now)
  end

  def self.total_verified_hours
    return HoursEntry.earned.inject(0) { |sum, entry| sum + entry.amount }
  end

  def self.total_hours_pending_verification
    return HoursEntry.pending.inject(0) { |sum, entry| sum + entry.amount }
  end

  private

  def user_entered?
    user_entered
  end

  def send_verified_email
    HoursEntryMailer.verified(self).deliver if newly_verified?
  end

  def newly_verified?
    verified && verified_changed? && amount > 0
  end

  def link_to_nonprofit
    nonprofit = Nonprofit.find_by_slug_or_create(self.organization)
    self.nonprofit_id = nonprofit.id
  end

  def can_link_to_nonprofit?
    self.organization && amount > 0
  end
end


