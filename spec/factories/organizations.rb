FactoryGirl.define do
  organization_name = Faker::Organization.name

  sequence :name do |n|
    "#{n}" + organization_name
  end

  sequence :url do |n|
    "#{n}" + organization_name.parameterize
  end

  factory :organization do
    name
    url

    factory :organization_with_programs_and_email_domains do
      ignore do
        programs_count 2
        email_domains_count 2
      end

      after(:create) do |organization, evaluator|
        create_list(:program, evaluator.programs_count, organization: organization)
        organization.reload
      end

      after(:create) do |organization, evaluator|
        create_list(:email_domain, evaluator.email_domains_count, organization: organization)
        organization.reload
      end
    end
  end

end