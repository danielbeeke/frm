# Global Context

It would be great to reuse Comunicas cache. My vision for the form is that you can use CustomElements independent of each other but ideally it would use Comunica in a singleton way. How can we have that? Is it also really needed?

One way would be to have a JavaScript object called context or something similar and pass that around.
One other option would be to put Comunica or this context into the globalThis.