# Widgets matcher

Multiple widgets may be able to display the same data, depending on definition some more advanced widget can be used.
The WidgetsMatcher is responsible for ensuring every SHACL property in the SHACL shape has a frm:widget.

Every Widget class has a couple of properties, like what properties it supports, what properties are required, what name the predicate many times has etc.
All those factors are fetched and then a formula is run to make a score for every widget, for every predicate. The highest score will be the widget that will be used. If there is no widget with a score higher than zero there will be no widget.