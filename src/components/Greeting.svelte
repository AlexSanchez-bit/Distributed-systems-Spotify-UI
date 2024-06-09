<script lang="ts">
  const currentTime = new Date();
  const currentHour = currentTime.getHours();
  let greeting = "";

  if (currentHour < 12) {
    greeting = "Buenos dias";
  } else if (currentHour < 10) {
    greeting = "Buenas Tardes ";
  } else {
    greeting = "Buenas noches";
  }
  // your script goes here
</script>

<h1 class="text-3xl font-bold">{greeting}</h1>
