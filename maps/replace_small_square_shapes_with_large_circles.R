library(rvest)
library(tidyverse)

# Set the input and output file paths for the maps
maps <- tribble(
       ~old, ~new,
       "maps/fibromyalgia_old.html", "maps/fibromyalgia.html",
       "maps/mbody_old.html", "maps/mbody.html",
)

# Set the ratio of the circle's radius to the square's hypotenuse. 
# This is a bit of trial and error, but it seems to work well for both maps.
scale_ratio <- 1.07

rewrite_map <- function(old_map, new_map) {
  read_html(old_map) |>
    html_nodes("body") |>
    html_nodes("area") |>
    html_attrs() |>
    bind_rows() |>
    mutate(alt = title) |>
    separate(coords, into = c("x1", "y1", "x2", "y2"), convert = TRUE) |>
    # Find the center of the squares
    mutate(x = round((x1 + x2) / 2),
           y = round((y1 + y2) / 2)) |>
    # Compute the radius of our new circles
    mutate(radius = round(mean(sqrt((x2 - x1)^2 + (y2 - y1)^2)) * scale_ratio)) |>
    mutate(shape = "circle",
           coords = paste(x, y, radius, sep = ",")) |>
    select(-x1, -y1, -x2, -y2, -radius) |>
    select(target, href, shape, coords, `data-key`, title, alt) |>
    mutate(area = paste0(
      '<area href="', href, '" shape="', shape, '" coords="', coords, '" data-key="', `data-key`, '" title="', title, '">'
    )) |>
    select(area) |>
    pull() |>
    write(new_map)
}

# Walk the `maps` vectors calling `rewrite_map` for each pair of old and new maps
purrr::walk2(maps$old, maps$new, rewrite_map)
