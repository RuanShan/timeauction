require 'spec_helper'

describe "add karma donations", :js => true do
  subject { page }

  set(:user) { FactoryGirl.create :user, :email => "johndoe@email.com", :admin => true }
  set(:nonprofit) { FactoryGirl.create :nonprofit }

  before do
    login(user)
    visit add_karma_path
    all(".add-karma-section-button")[0].click
  end

  it "shows karma points as soon as section opened" do
    within ".total-karma-to-add" do
      page.should have_content("10")
    end
  end

  it "karma points gone when section closed" do
    within ".total-karma-to-add" do
      page.should have_content("10")
    end
    all(".add-karma-section-button")[0].click
    within ".total-karma-to-add" do
      page.should have_content("0")
    end
  end

  it "$10 pre-selected" do
    expect(find("li.selected").text).to eq("$10")
  end

  it "can change to other pre-selected amounts" do
    dollar_link_25 = all(".amount-list li")[1]
    dollar_link_25.click
    within ".total-karma-to-add" do
      page.should have_content("25")
    end
    expect(find("li.selected")).to eq(dollar_link_25)

    dollar_link_50 = all(".amount-list li")[2]
    dollar_link_50.click
    within ".total-karma-to-add" do
      page.should have_content("50")
    end
    expect(find("li.selected")).to eq(dollar_link_50)

    dollar_link_100 = all(".amount-list li")[3]
    dollar_link_100.click
    within ".total-karma-to-add" do
      page.should have_content("100")
    end
    expect(find("li.selected")).to eq(dollar_link_100)
  end

  context "sliders" do
    it "donations changes value" do
      js_script = "$('.charity-range-slider').val(3)"
      page.execute_script(js_script)

      expect(find(".charity-amount").text).to eq("$3.00")
    end

    it "donations changes tip value correctly" do
      js_script = "$('.charity-range-slider').val(4)"
      page.execute_script(js_script)

      expect(find(".ta-tip-amount").text).to eq("$6.00")
    end

    # it "tip changes value" --> assume this works since cannot have a "set" event listener on both sliders
    # it "tip changes donation value correctly" --> assume this works since cannot have a "set" event listener on both sliders

    it "retains selection ratio after selecting other amounts" do
      js_script = "$('.charity-range-slider').val(8)"
      page.execute_script(js_script)

      dollar_link_25 = all(".amount-list li")[1]
      dollar_link_25.click

      expect(find(".charity-amount").text).to eq("$20.00")
    end
  end

  context "custom amount" do
    before do
      find(".custom-input-text").click
    end

    it "can select and input" do
      find(".custom-input-box").set("82.40")
      within ".total-karma-to-add" do
        page.should have_content("82")
      end
    end

    context "errors" do
      it "shows when letter" do
        find(".custom-input-box").set("a")
        within ".total-karma-to-add" do
          page.should have_content("-")
        end
        page.should have_selector('.custom-input-error', visible: true)
        within ".custom-input-error" do
          page.should have_content("Enter a number")
        end
      end

      it "shows when negative" do
        find(".custom-input-box").set("-1")
        within ".total-karma-to-add" do
          page.should have_content("-")
        end
        page.should have_selector('.custom-input-error', visible: true)
        within ".custom-input-error" do
          page.should have_content("Enter a number")
        end
      end

      it "shows when zero" do
        find(".custom-input-box").set("0")
        within ".total-karma-to-add" do
          page.should have_content("-")
        end
        page.should have_selector('.custom-input-error', visible: true)
        within ".custom-input-error" do
          page.should have_content("Be positive")
        end
      end

      it "shows when too large" do
        find(".custom-input-box").set("100000")
        within ".total-karma-to-add" do
          page.should have_content("-")
        end
        page.should have_selector('.custom-input-error', visible: true)
        within ".custom-input-error" do
          page.should have_content("You're being too nice")
        end
      end
    end
  end

  context "no existing card" do
    it "doesn't show Use Your Card" do
      page.should_not have_selector(".has-default-card-holder", visible: true)
    end

    it "prompts Stripe checkout when click 'Add'" do
      sleep 1
      find(".add-karma-main-button").click
      sleep 3
      page.should have_selector("iframe.stripe_checkout_app", visible: true)
    end
  end

  context "existing card" do
    it "shows checkbox already selected as default"

    it "shows correct card details"

    context "checkbox selected" do
      it "shows warning under 'Add'"
    end

    context "checkbox unselected" do
      it "removes warning"

      it "prompts Stripe checkout"
    end
  end
end
