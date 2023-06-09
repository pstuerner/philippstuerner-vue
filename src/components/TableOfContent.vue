<template>
    <div id="toc-parent"></div>
</template>

<script>
export default {
    mounted () {
        var vm = this;
        var parents = document.querySelectorAll("[data-toc]");

        if (!parents) return 0;

        parents.forEach(function (parent, nth) {
            vm.toc(parent, nth);
            vm.tocMakeLinks(parent);
            vm.tocCustomClass(parent);
            vm.tocCustomId(parent);
            vm.tocCustomHeader(parent);
            vm.tocCustomParent(parent);
        });
    },
    methods: {
        toc (parent, nth) {
            var tocNode = document.createElement("ASIDE");
            var tocContentNode = document.createElement("DIV");
            var tocHeaderNode = document.createElement("H3");
            var tocHeaderTextNode = document.createTextNode("Table of content");
            // Using Array() to convert from the NodeList results in a object like this: [NodeList(n)],
            // which must be accessed using double index: allHeaders[0][n]. Calling Array(allHeaders)
            // after the variable has been defined take to a different behavior and data can be accessed
            // normally as allHeaders[n].
            var allHeaders = Array.from(parent.querySelectorAll(".section-heading")); //('H1, H2, H3, H4, H5, H6'));
            var listElArray = [];
            var span, i, j, list, listEl, text;

            // Finding all the <h*> node and making the list element. The listElArray is completed but not hierarchically ordered.
            for (i = 0; i < allHeaders.length; i++) {
                listEl = document.createElement("LI");
                span = document.createElement("SPAN");
                text = document.createTextNode(allHeaders[i].innerText);
                span.appendChild(text);
                listEl.appendChild(span);
                listElArray.push(listEl);
            }

            // Building the hierarchy's array. It shrinks because low level items (e.g. <h3>)
            // are appended to higher ones (e.g. <h2> or <h1> in case no <h2> exist before).
            for (i = allHeaders.length; i--; ) {
                for (j = i; j--; ) {
                    if (allHeaders[i].tagName > allHeaders[j].tagName) {
                        if (listElArray[j].children[1] == undefined) {
                            list = document.createElement("OL");
                            listElArray[j].appendChild(list);
                        }
                        listElArray[j].children[1].insertBefore(
                            listElArray[i],
                            listElArray[j].children[1].firstChild
                        );
                        listElArray.splice(i, 1);
                        allHeaders.splice(i, 1);
                        break;
                    }
                }
            }

            // Filling the tocNode and appending it to the DOM.
            list = document.createElement("OL");
            for (i = 0; i < listElArray.length; i++) {
                list.appendChild(listElArray[i]);
            }
            tocHeaderNode.appendChild(tocHeaderTextNode);
            tocNode.appendChild(tocHeaderNode);
            tocContentNode.appendChild(list);
            tocNode.appendChild(tocContentNode);
            tocNode.setAttribute("class", "toc-default");
            tocNode.setAttribute("id", "toc-" + nth);
            parent.insertBefore(tocNode, parent.firstChild);
        },
        tocMakeLinks (parent) {
            var tocLi = parent.firstChild.querySelectorAll("LI");
            var tocParentId = parent.getAttribute("data-toc-parent-id");
            var tocParent = document.getElementById(tocParentId);

            tocLi.forEach(function (liNode, i) {
                liNode.firstChild.addEventListener("click", function () {
                    parent.querySelectorAll(".section-heading")[i].scrollIntoView();
                });
            });
        },

        // Allow user to add his/her own classes through data-toc-class attribute
        tocCustomClass (parent) {
            var tocClass = parent.getAttribute("data-toc-class");

            if (tocClass) {
                parent.firstChild.setAttribute("class", "toc-default " + tocClass);
            }
        },

        // Allow user to set his/her own id through data-toc-id attribute
        tocCustomId (parent) {
            var tocId = parent.getAttribute("data-toc-id");

            if (tocId) {
                parent.firstChild.setAttribute("id", tocId);
            }
        },

        // Allow user to set his/her own header through data-toc-header attribute
        tocCustomHeader (parent) {
            var tocHeader = parent.getAttribute("data-toc-header");

            if (tocHeader && tocHeader.toLowerCase() == "none") {
                parent.firstChild.removeChild(parent.firstChild.firstChild);
            } else if (tocHeader) {
                parent.firstChild.firstChild.innerText = tocHeader;
            }
        },

        // Allow user to append toc to a different element then the one it is generated for.
        tocCustomParent (parent) {
            var tocParentId = parent.getAttribute("data-toc-parent-id");
            var tocParent = document.getElementById(tocParentId);

            if (tocParent) {
                tocParent.appendChild(parent.firstChild);
            }
        }
    }
}
</script>