require 'json'
require 'faker'

File.open('seeds/users.json', 'w') do |file|
file.puts('[')  
1000.times do
  @first_name = Faker::Name.first_name
  @last_name = Faker::Name.last_name
  @phone_number = Faker::Number.number(10)
  @phone_id = @phone_number[0...3]

  my_hash = {
    firstName: @first_name.downcase,
    lastName: @last_name.downcase,
    email: @first_name.downcase + "-" + @last_name.downcase + "@example.com",
    phone: @phone_number,
    phone_sort_id: @phone_id
  }
  file.puts(JSON.generate(my_hash) + ",")
end
file.puts("]")
end